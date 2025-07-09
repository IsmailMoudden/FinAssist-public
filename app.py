import os
from flask import Flask, request, jsonify, send_from_directory
from utils.ocr import ocr_image
from utils.vision import describe_image
from utils.pdf import extract_pdf_text_and_pages
import requests
from dotenv import load_dotenv
import re

load_dotenv()
OPENROUTER_API_KEY = os.getenv('OPENROUTER_API_KEY')

SYSTEM_PROMPT = (
    "Tu es un assistant expert en analyse de documents financiers (fonds, private credit, BDC, etc.), mais tu sais aussi traiter d’autres types de documents.\n"
    "\n"
    "Ta mission est de fournir des réponses techniques, précises et expertes, adaptées à un public de professionnels ou d'experts en finance.\n"
    "N’hésite pas à utiliser un vocabulaire financier avancé, à détailler les concepts, à expliciter les mécanismes, et à fournir des analyses pointues.\n"
    "\n"
    "Ta priorité est de répondre précisément à la question posée par l’utilisateur, en t’appuyant uniquement sur le contenu fourni.\n"
    "Si possible, cite directement le texte du document pour appuyer ta réponse, en indiquant la page si pertinent.\n"
    "\n"
    "Pour t’aider à extraire les informations pertinentes dans les documents de type fonds ou présentation financière, tu peux t’appuyer sur les catégories suivantes si elles sont utiles à la question :\n"
    "  1. Structure et métadonnées du fonds (nom, type, date, véhicule, juridiction, minimum d’investissement)\n"
    "  2. Objectifs financiers et stratégie (rendement, profil de risque, type de dette, focus géographique/sectoriel)\n"
    "  3. Frais et conditions de souscription (management fee, incentive fee, autres frais, conditions de rachat, délais)\n"
    "  4. Performance et indicateurs financiers (net return, distribution rate, composition du portefeuille, AUM, stats sur les prêts)\n"
    "  5. Caractéristiques différenciantes (marché cible, approche, plateforme, sourcing)\n"
    "  6. Avertissements, limitations, risques (illiquidité, leverage, limitations réglementaires, disclaimers, valorisation)\n"
    "\n"
    "Mais tu dois toujours adapter ta réponse à la question : si la question porte sur un point précis, réponds directement, en citant le document (avec page si possible). Si la question est générale, structure ta réponse de façon claire et synthétique, en utilisant les catégories si pertinent.\n"
    "\n"
    "Si la question porte sur une page précise (ex : “Que contient la page 6 ?”), réponds uniquement avec le contenu de cette page, en le citant textuellement et en indiquant le numéro de page.\n"
    "\n"
    "Si une information demandée n’est pas mentionnée dans le document, indique-le clairement : 'Non mentionné dans le document.'\n"
    "\n"
    "Si la question est ambiguë, propose une reformulation avant de répondre.\n"
    "\n"
    "Utilise le markdown pour structurer la réponse : titres en gras, listes à puces, citations, emojis pour la lisibilité (📊, 📈, 💡, ⚠️, etc.).\n"
    "\n"
    "N’invente jamais d’information. Base-toi uniquement sur le contenu fourni.\n"
    "\n"
    "À la fin de chaque réponse, propose toujours : 'Voulez-vous plus de détails ou une analyse approfondie ?'\n"
)

app = Flask(__name__)

@app.route('/ask', methods=['POST'])
def ask():
    print('ASK endpoint called')
    print('FILES:', request.files)
    print('FORM:', request.form)
    files = request.files.getlist('files')
    question = request.form.get('question')
    if not files or not question:
        return jsonify({'error': 'Missing files or question'}), 400

    all_contents = []
    all_pages = []
    for file in files:
        filename = file.filename.lower()
        content = ""
        if filename.endswith('.pdf'):
            try:
                pages = extract_pdf_text_and_pages(file.read())
                for p in pages:
                    if p['text']:
                        content += f"\n[Page {p['page']}]\n{p['text']}"
                        all_pages.append({'page': p['page'], 'text': p['text']})
            except Exception as e:
                content += f"\n[PDF extraction error: {e}]"
        elif filename.endswith(('.png', '.jpg', '.jpeg', '.bmp', '.tiff')):
            try:
                desc = describe_image(file.read())
                content += f"\n[Image description]\n{desc}"
            except Exception:
                content += f"\n[OCR]\n{ocr_image(file.read())}"
        elif filename.endswith('.txt'):
            content += f"\n[Text file]\n{file.read().decode('utf-8', errors='ignore')}"
        else:
            content += f"\n[Unsupported file: {filename}]"
        all_contents.append(content)

    full_text = "\n---\n".join(all_contents)

    # Nouvelle logique : question sur une page précise ?
    page_match = re.search(r'page[s]?\s*(\d+)', question, re.IGNORECASE)
    if page_match and all_pages:
        page_num = int(page_match.group(1))
        page_text = next((p['text'] for p in all_pages if p['page'] == page_num), None)
        # Sommaire des pages pour contexte
        page_summaries = []
        for p in all_pages:
            summary = p['text'][:120].replace('\n', ' ').replace('\r', ' ')
            page_summaries.append(f"Page {p['page']}: {summary}...")
        summary_text = "\n".join(page_summaries)
        if page_text:
            preview = page_text[:300].replace('\n', ' ').replace('\r', ' ')
            user_prompt = (
                f"Voici le sommaire des pages du document :\n{summary_text}\n\n"
                f"Aperçu du texte extrait pour la page {page_num} :\n{preview}\n\n"
                f"Voici le texte complet de la page {page_num} :\n{page_text}\n\n"
                f"Question : {question}"
            )
        else:
            user_prompt = f"La page {page_num} n'a pas été trouvée dans le document.\n\nQuestion : {question}"
    else:
        user_prompt = f"Voici le contenu des documents :\n{full_text}\n\nQuestion : {question}"

    # DEBUG: Affiche le contenu envoyé au modèle

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json"
    }
    data = {
        "model": "openai/gpt-4-turbo",
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt}
        ]
    }
    resp = requests.post(
        "https://openrouter.ai/api/v1/chat/completions",
        headers=headers,
        json=data,
        timeout=60
    )
    if resp.status_code != 200:
        return jsonify({'error': 'OpenRouter error', 'details': resp.text}), 500

    answer = resp.json()['choices'][0]['message']['content']
    return jsonify({'answer': answer})

# Serve index.html at root
@app.route('/')
def serve_index():
    return send_from_directory('static', 'index.html')

# Serve static files (JS, CSS, etc.)
@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('static', path)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5002) 