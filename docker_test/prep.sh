mkdir -pv ./front/data
mkdir -pv ./back/data
mkdir -pv ./postgres/data

cp -r ../front/src ./front/data/src
cp ../front/package.json ./front/data/package.json
cp ../front/tsconfig.json ./front/data/tsconfig.json

cp -r ../back/src ./back/data/src
cp ../back/package.json ./back/data/package.json
cp ../back/tsconfig.json ./back/data/tsconfig.json

