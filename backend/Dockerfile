FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:0.13.1 /uv /bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev
COPY main.py ./
ENV PORT=8080
CMD ["sh", "-c", "/app/.venv/bin/uvicorn main:app --host 0.0.0.0 --port ${PORT}"]
