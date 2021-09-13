export default [{
  "id": 1,
  "type": "Source: Collection Source",
  "pact": "Data Source",
  "contents": "Source: Collection Source",
  "parallelism": 1,
  "heap": 64,
  "off-heap": 128,
  "rocksdb": 256
}, {
  "id": 2,
  "type": "Source: Collection Source",
  "pact": "Data Source",
  "contents": "Source: Collection Source",
  "parallelism": 1,
  "heap": 64,
  "off-heap": 128,
  "rocksdb": 256
}, {
  "id": 3,
  "type": "Source: Collection Source",
  "pact": "Data Source",
  "contents": "Source: Collection Source",
  "parallelism": 1,
  "heap": 64,
  "off-heap": 128,
  "rocksdb": 256,
  "edit": true
}, {
  "id": 4,
  "type": "Flat Map",
  "pact": "Operator",
  "contents": "Flat Map",
  "parallelism": 4,
  "heap": 64,
  "edit": true,
  "predecessors": [{
    "id": 1,
    "ship_strategy": "REBALANCE",
    "side": "second"
  }]
}, {
  "id": 5,
  "type": "Keyed Aggregation",
  "pact": "Operator",
  "contents": "Keyed Aggregation",
  "parallelism": 4,
  "heap": 64,
  "off-heap": 128,
  "rocksdb": 256,
  "predecessors": [{
    "id": 2,
    "ship_strategy": "HASH",
    "side": "second"
  }, {
    "id": 3,
    "ship_strategy": "HASH",
    "side": "second"
  }]
}, {
  "id": 6,
  "type": "Sink: Print to Std. Out",
  "pact": "Data Sink",
  "contents": "Sink: Print to Std. Out",
  "parallelism": 4,
  "heap": 64,
  "off-heap": 128,
  "rocksdb": 256,
  "predecessors": [{
    "id": 4,
    "ship_strategy": "FORWARD",
    "side": "second"
  }, {
    "id": 5,
    "ship_strategy": "FORWARD",
    "side": "second"
  }]
}, {
  "id": 7,
  "type": "Sink: Print to Std. Out",
  "pact": "Data Sink",
  "contents": "Sink: Print to Std. Out",
  "parallelism": 4,
  "heap": 64,
  "off-heap": 128,
  "rocksdb": 256,
  "predecessors": [{
    "id": 5,
    "ship_strategy": "FORWARD",
    "side": "second"
  }]
}];
