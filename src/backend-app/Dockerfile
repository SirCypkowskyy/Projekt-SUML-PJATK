FROM python:3.12-slim

WORKDIR /code

COPY ./requirements-linux.txt /code/requirements-linux.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements-linux.txt

COPY ./api ./api
COPY ./core ./core
COPY ./data ./data
COPY ./helpers ./helpers
COPY ./middleware ./middleware
COPY ./schemas ./schemas
COPY ./deps.py ./deps.py
COPY ./initial_data.json ./initial_data.json
COPY ./main.py /code/
COPY ./llm ./llm


CMD ["fastapi", "run", "main.py", "--port", "80"]