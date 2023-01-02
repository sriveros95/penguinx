FROM public.ecr.aws/bitnami/python:3.9.9-prod

COPY app/requirements.txt /tmp/

RUN pip install -r /tmp/requirements.txt
RUN pip install uvicorn

RUN useradd --create-home penguinx && chown -R penguinx /home/penguinx
WORKDIR /home/penguinx

# copy the content of the local src directory to the working directory
COPY  --chown=penguinx:penguinx  . .
RUN chown penguinx:penguinx -R /home/penguinx
USER penguinx

EXPOSE 8000

# command to run on container start
CMD [ "python", "./main.py" ]