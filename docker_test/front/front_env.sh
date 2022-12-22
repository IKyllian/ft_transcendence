rm -f env.ts
touch env.ts
echo "
export const uid: string = \"$API42_CLIENT_ID\";
export const baseUrl: string = \"$BASE_URL\";
export const socketUrl: string = \"$SOCKET_URL\";
" >> env.ts