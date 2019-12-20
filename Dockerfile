FROM node:12.13.1

# Create app directory
RUN mkdir -p /usr/src/timeseries
WORKDIR /usr/src/timeseries

# Install app dependencies
COPY package.json /usr/src/timeseries/
RUN npm install

# Copy app source
COPY . /usr/src/timeseries

# Build app
RUN npm run build

EXPOSE 8000
EXPOSE 8001

CMD ["npm", "start"]
