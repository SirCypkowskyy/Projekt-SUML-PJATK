FROM python:3.9

WORKDIR /code

COPY ./requirements.txt /code/requirements.txt
COPY ./.env ~/sumlapp/.env
COPY ./initial_data.json ~/sumlapp/initial_data.json

RUN pip install --no-cache-dir --upgrade -r /code/requirements.txt


COPY ./main.py /code/


CMD ["fastapi", "run", "main.py", "--port", "80"]