FROM python:3.12

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt

COPY ./initial_data.json ./initial_data.json
COPY ./data ./data
COPY ./helpers ./helpers
COPY ./core ./core
COPY ./api ./api
COPY ./schemas ./schemas
COPY ./deps.py ./deps.py


COPY ./main.py /code/


CMD ["fastapi", "run", "main.py", "--port", "80"]