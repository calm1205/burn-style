FROM python:3.14-bookworm

WORKDIR /app

COPY --from=postgres:18-bookworm /usr/lib/postgresql/18/bin/* /usr/local/bin/
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen
COPY . . 

ENV PATH="/app/.venv/bin:${PATH}"
ENV PYTHONDONTWRITEBYTECODE=1

CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]

