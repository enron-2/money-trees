FROM public.ecr.aws/lambda/nodejs:14
RUN yum install -y \
    curl \
    unzip \
    git

RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip

RUN ./aws/install && rm -r ./aws

COPY . ${LAMBDA_TASK_ROOT}

ENV HOME="/tmp"

# Entrypoint
CMD [ "index.handler" ]
