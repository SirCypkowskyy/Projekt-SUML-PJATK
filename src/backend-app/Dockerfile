FROM python:3.12-slim

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./api ./api
COPY ./core ./core
COPY ./data ./data
COPY ./helpers ./helpers
COPY ./middleware ./middleware
COPY ./schemas ./schemas
COPY ./deps.py ./deps.py
COPY ./initial_data.json ./initial_data.json
COPY ./main.py /code/


CMD ["fastapi", "run", "main.py", "--port", "80"]