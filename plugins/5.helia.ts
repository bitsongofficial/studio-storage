import { UnixFS, unixfs } from "@helia/unixfs";
import { LevelBlockstore } from "blockstore-level";
import { LevelDatastore } from "datastore-level";
import { createHelia } from "helia";
import { bootstrap } from '@libp2p/bootstrap'
import { circuitRelayTransport, circuitRelayServer } from '@libp2p/circuit-relay-v2'
import { tcp } from '@libp2p/tcp'
import { webSockets } from '@libp2p/websockets'
import { noise } from '@chainsafe/libp2p-noise'
import { yamux } from '@chainsafe/libp2p-yamux'
import { mplex } from '@libp2p/mplex'
import { identify as identifyService } from '@libp2p/identify'
import { autoNAT as autoNATService } from '@libp2p/autonat'
import { uPnPNAT as uPnPNATService } from '@libp2p/upnp-nat'
import { gossipsub } from '@chainsafe/libp2p-gossipsub'
import { dcutr as dcutrService } from '@libp2p/dcutr'
import { kadDHT } from '@libp2p/kad-dht'
import { ping as pingService } from '@libp2p/ping'

declare module 'h3' {
  interface H3EventContext {
    fs: UnixFS
  }
}

export default defineNitroPlugin(async (nitroApp) => {
  console.log('[helia] plugin loading...')

  const blockstore = new LevelBlockstore('./.helia/blockstore')
  const datastore = new LevelDatastore('./.helia/datastore')
  const helia = await createHelia({
    blockstore,
    datastore,
    libp2p: {
      datastore,
      addresses: {
        listen: [
          // studio-storage is not dialable, we're only retrieving data from IPFS
        ]
      },
      connectionManager: {
        // disable auto-dial because we don't want to be doing a lot of work to keep connections alive.
        minConnections: 0
      },
      transports: [
        circuitRelayTransport({
          discoverRelays: 1
        }),
        tcp(),
        webSockets(),
      ],
      connectionEncryption: [
        noise()
      ],
      streamMuxers: [
        yamux(),
        mplex()
      ],
      peerDiscovery: [
        bootstrap({
          list: [
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmQCU2EcMqAqQPR2i9bChDtGNJchTbq5TbXJJ16u19uLTa',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
            '/dnsaddr/bootstrap.libp2p.io/p2p/QmcZf59bWwK5XFi76CZX8cbJ4BhTzzA3gU1ZjYZcYW3dwt',
            '/ip4/104.131.131.82/tcp/4001/p2p/QmaCpDMGvV2BGHeYERUEnRQAwe3N8SzbUtfsmvsqQLuvuJ'
          ]
        })
      ],
      services: {
        identify: identifyService(),
        autoNAT: autoNATService(),
        upnp: uPnPNATService(),
        pubsub: gossipsub(),
        dcutr: dcutrService(),
        dht: kadDHT({
          // don't do DHT server work.
          clientMode: true,
        }),
        relay: circuitRelayServer({
          // don't advertise as a circuitRelay server because we have one job, and that is to:  listen for http requests, maybe fetch content, return http responses.
          // advertise: true
        }),
        ping: pingService()
      }
    }
  })

  const fs = unixfs(helia)

  nitroApp.hooks.hook('request', async (event) => {
    console.log('[helia] plugin request...')

    event.node.req.setMaxListeners(100)
    event.context.fs = fs
  })

  nitroApp.hooks.hook('close', async () => {
    console.log('[helia] plugin close...')
    await helia.stop()
  })

  console.log('[helia] plugin loaded')
})