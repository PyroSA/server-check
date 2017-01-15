export host=127.0.0.1
if [ $# -gt 0 ]; then export host=$1; fi
export ports=(8001 8002 8003 8004 8005 8006 8007 8008)

rm -rf results/lastrun
mkdir results/lastrun

echo "Load test on $host"

for port in "${ports[@]}"
do
  curl --retry 0 -G "http://${host}:{${port}}/loadCpu/{250,500,750,1000}" -o "results/lastrun/#1_#2" &
done
wait

curl --retry 0 -G "http://${host}:{8001}/status" -o "results/lastrun/status"
