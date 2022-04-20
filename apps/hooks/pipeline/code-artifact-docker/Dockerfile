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

COPY .  ${LAMBDA_TASK_ROOT}

# Entrypoint
CMD [ "index.handler" ]
