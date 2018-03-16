FROM jamesquigley/audiogram-base

RUN useradd -m audiogram
WORKDIR /home/audiogram

# Clone repo
COPY package.json package.json

# Install dependencies
RUN npm install

COPY . .


RUN npm run build

# Non-privileged user
USER audiogram

CMD [ "npm", "start" ]