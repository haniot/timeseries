FROM node:12.13.1

# Create app directory
RUN mkdir -p /usr/src/mhealth
WORKDIR /usr/src/mhealth

# Install app dependencies
COPY package.json /usr/src/mhealth/
RUN npm install

# Copy app source
COPY . /usr/src/mhealth

# Build app
RUN npm run build

EXPOSE 4000
EXPOSE 4001

CMD ["npm", "start"]
