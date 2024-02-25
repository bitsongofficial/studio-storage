import { CID } from 'multiformats/cid'

export default eventHandler(async (event) => {
  const cid: string = getRouterParam(event, 'cid')
  const { fs } = event.context

  let type: string | undefined

  try {
    console.log('fetching from helia...')

    if (fs === undefined) throw new Error('fs is undefined')

    for await (const chunk of fs.cat(CID.parse(cid))) {
      // TODO: add check mimetype
      event.node.res.write(Buffer.from(chunk))
    }
  } catch (e) {
    console.error('error fetching from helia:', e)
  } finally {
    event.node.res.end()
  }
})