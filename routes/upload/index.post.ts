export default defineEventHandler(async (event) => {
  // get header content type
  const contentType = event.headers.get('content-type')

  if (contentType.startsWith('multipart/form-data')) {
    console.log('multipart/form-data')

    const file = await readMultipartFormData(event)
    const _file = file?.[0] as {
      filename: string
      data: Buffer
    }

    console.log('filename:', _file.filename)
    console.log('size:', _file.data.length)
  } else {
    console.log('raw data')

    const body = await readBody(event)

    console.log('size:', body.length)

    // parse file
  }
})