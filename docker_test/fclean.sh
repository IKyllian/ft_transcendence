docker-compose -f ./docker-compose.yaml --env-file ./.env down
docker stop $(docker ps -qa)
docker rm $(docker ps -qa)
docker rmi -f $(docker images -qa)
# docker volume rm $(docker volume ls -q)
docker network rm $(docker network ls -q)
docker system prune -af
# docker system prune --volumes -af
# rm -rf /home/kzennoun/data/transcendence_volumes
rm -rf ./back/data
rm -rf ./front/data
rm -rf ./postgres/data
return 0