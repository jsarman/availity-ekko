FROM openshift/nodejs-010-centos7

# Enable EPEL for Node.js
RUN     rpm -Uvh http://download.fedoraproject.org/pub/epel/6/i386/epel-release-6-8.noarch.rpm
# Install Node.js and npm
RUN     yum install -y npm


# Install app dependencies
RUN npm install


EXPOSE 9999

CMD ["node", "index.js"]