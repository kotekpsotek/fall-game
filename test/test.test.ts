import { test, assert, describe, it, expect } from "vitest";
import { createLibp2p } from "libp2p"
import { webSockets } from "@libp2p/websockets";
import { noise } from "@chainsafe/libp2p-noise";
import { mplex } from "@libp2p/mplex";
import { yamux } from "@chainsafe/libp2p-yamux";
import { bootstrap } from '@libp2p/bootstrap'
import { applyToDifferenceInDimensions } from "../src/lib/api/online.game";


/* describe("peer-2-peer", () => {
    const { log } = console;
    
    test("lib2p", async () => {
        // Known peers addresses
        const bootstrapMultiaddrs = [
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmbLHAnMoJPWSCR5Zhtx6BHJX9KiKNN6tpvbUcqanj75Nb',
          '/dnsaddr/bootstrap.libp2p.io/p2p/QmNnooDu7bfjPFoTZYxMNLWUQJyrVwtbZg5gBMjTezGAJN'
        ];
        
        const node = await createLibp2p({
          transports: [webSockets()],
          connectionEncryption: [noise()],
          streamMuxers: [yamux(), mplex()],
          peerDiscovery: [
            bootstrap({
              list: bootstrapMultiaddrs, // provide array of multiaddrs
            })
          ]
        });
        
        node.addEventListener('peer:discovery', (evt) => {
          console.log('Discovered %s', evt.detail.id.toString()) // Log discovered peer
        });
        
        node.addEventListener('peer:connect', (evt) => {
          console.log('Connected to %s', evt.detail.toString()) // Log connected peer
        });

        const { services } = node as any;
        
        services.pubsub.subscribe("news");
        services.pubsub.addEventListener("message", (evt) => {
            console.log("Message recived");
        })
    });
}) */

describe("Online Test", () => {
  it("Spawn Dimensions Scaling Between Other Clients Screens", () => {
    const his = { width: 1400, height: 1000 };
    const my = { myWidth: 700, myHeight: 300 };
    const spawningPos = { x: 700, y: 500 };
    const call = applyToDifferenceInDimensions(spawningPos, { ...his, ...my });
    console.log(call)

    // Mocking tests
    expect(call).toStrictEqual({ x: 350, y: 150 });
  });

  it("Spawn Dimensions Scaling Between Same Clients Screens", () => {
    const his = { width: 1400, height: 1000 };
    const my = { myWidth: his.width, myHeight: his.height };
    const spawningPos = { x: 800, y: 500 };
    const call = applyToDifferenceInDimensions(spawningPos, { ...his, ...my });
    console.log(call)

    // Mocking tests
    expect(call).toStrictEqual({ x: 800, y: 500 });
  });

  it("Whether dimensions rescaling work in eligible way for spawn posission renundancy to screen dimensions", () => {
    const his = { width: 1400, height: 1000 };
    const my = { myWidth: his.width, myHeight: his.height };
    const spawningPos = { x: 18000, y: 5000000 };
    const call = applyToDifferenceInDimensions(spawningPos, { ...his, ...my });
    console.log(call);

    // Mocking tests
    expect(call).toStrictEqual({ x: 1400, y: 1000 });
  })
})