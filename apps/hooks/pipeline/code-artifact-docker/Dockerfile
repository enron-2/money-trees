FROM alpine:latest as build
WORKDIR /builder
RUN apk add --update-cache \
    curl \
    zip 
RUN curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip" \
    && unzip awscliv2.zip

FROM public.ecr.aws/lambda/nodejs:14
COPY --from=build /builder/aws ./aws
RUN ./aws/install && rm -r ./aws
# RUN npm i -g npm <- or some specific version, not sure if this is needed

COPY ./package*.json ./
RUN npm ci
COPY .  ${LAMBDA_TASK_ROOT}

# Use secrets manager or other ways to grant access to CA
# ENV AWS_ACCESS_KEY_ID=
# ENV AWS_SECRET_ACCESS_KEY=
# ENV AWS_DEFAULT_REGION=

# Entrypoint
CMD [ "index.handler" ]