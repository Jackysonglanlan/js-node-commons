# !/bin/sh
#

set -euo pipefail
trap "echo 'error: Script failed: see failed command above'" ERR


_createTestDir(){
  MockClientDir=tmp/client
  rm -rf $MockClientDir
  mkdir -p $MockClientDir
  cd $MockClientDir
}

_simulate_client_npm_install(){
  npm init -f
  npm i ../.. # install our module
}

run(){
  _createTestDir
  _simulate_client_npm_install
}



run
