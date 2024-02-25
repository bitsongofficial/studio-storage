export default eventHandler(async (event) => {
  const { fs } = event.context
  if (fs === undefined) throw new Error('fs is undefined')

  const file = new File(['ciao angelo'], 'hello.txt', { type: 'text/javascript' })

  const cid = await fs.addBytes(await file.arrayBuffer().then(buffer => new Uint8Array(buffer)))
  console.log('Added file:', cid.toString()) 

  return { 
    cid: cid.toString() 
  }
})
