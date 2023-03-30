export SERVER_KEYTAB="$(kube-fetch-secret file-service-keytab server)"
export CLIENT_KEYTAB="$(kube-fetch-secret file-service-keytab client)"
echo $CLIENT_KEYTAB
echo $SERVER_KEYTAB
npm run start:shell
