FROM python:3.11-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY requirements.txt .

# Créer un environnement virtuel et installer les dépendances
RUN python -m venv /app/venv
RUN /app/venv/bin/pip install --upgrade pip
RUN /app/venv/bin/pip install -r requirements.txt

# Copier le code de l'application
COPY . .

# Exposer le port
EXPOSE 8080

# Commande de démarrage avec Gunicorn
CMD ["/app/venv/bin/gunicorn", "--bind", "0.0.0.0:8080", "--workers", "2", "--timeout", "120", "--access-logfile", "-", "--error-logfile", "-", "--log-level", "info", "wsgi:app"] 