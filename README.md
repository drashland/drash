# Drash

<img align="right" src="https://drash.land/logo-drash.svg" alt="Drash Land - Drash logo" height="100" style="max-height: 100px; margin-bottom: 20px;">

[![Latest Release](https://img.shields.io/github/release/drashland/drash.svg?color=bright_green&label=latest)](https://github.com/drashland/drash/releases/latest)
[![CI](https://img.shields.io/github/workflow/status/drashland/drash/master?label=ci)](https://github.com/drashland/drash/actions/workflows/master.yml)

Drash is a TypeScript HTTP microframework. It works for Deno, Node, Bun, and any
other JavaScript/TypeScript runtime.

View the full documentation at https://drash.land/drash.

In the event the documentation pages are not accessible, please view the raw
version of the documentation at
https://github.com/drashland/website-v2/tree/main/docs.

## Benchmarks

### Overview

The benchmarks below were performed using the Deno tasks in this repo and the
`wrk` command. You can run them yourself on your machine. Steps are below:

1. Pull down this repo and `cd` into it.
1. Run `deno task run-server:bun` or `deno task run-server:deno`.
1. Run `wrk` using `wrk -c 40 -d 10 http://localhost:1447`.

### Notes

- No change in performance when using `URLPattern` and a plain JavaScript
  approach

### Bun

#### Bun and Machine Information

- Bun
  - Version 0.1.13
- Machine
  - MacBook Pro (16-inch, 2019)
  - Processor 2.6 GHz 6-Core Intel Core i7
  - Memory 16 GB 2667 MHz DDR4

#### Results

```
$ wrk -c 40 -d 10 http://localhost:1447

Running 10s test @ http://localhost:1447
  2 threads and 40 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.97ms    2.24ms  24.51ms   95.38%
    Req/Sec    34.64k     4.58k   42.48k    66.00%
  690019 requests in 10.01s, 67.78MB read
Requests/sec:  68950.81
Transfer/sec:      6.77MB
```

### Deno

#### Deno and Machine Information

- Deno
  - Version 1.26.0
- Machine
  - MacBook Pro (16-inch, 2019)
  - Processor 2.6 GHz 6-Core Intel Core i7
  - Memory 16 GB 2667 MHz DDR4

#### Results

```
$ wrk -c 40 -d 10 http://localhost:1447

Running 10s test @ http://localhost:1447
  2 threads and 40 connections
  Thread Stats   Avg      Stdev     Max   +/- Stdev
    Latency     0.98ms  212.10us   6.23ms   95.98%
    Req/Sec    20.28k     1.13k   21.15k    93.56%
  407576 requests in 10.10s, 63.75MB read
Requests/sec:  40352.02
Transfer/sec:      6.31M
```

### Node

WIP

## Implementation Details

- Core should not contain any code that is not cross-platform (e.g.,
  `URLPattern`)
