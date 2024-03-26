export default defineEventHandler(async (event) => {
  // get header content type
  const contentType = event.headers.get('content-type')

  if (contentType.startsWith('multipart/form-data')) {
    console.log('multipart/form-data')

    const [file] = await readMultipartFormData(event)
    if (!file) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Bad Request',
      })
    }

    console.log('filename:', file.filename)
    console.log('size:', file.data.length)

    const cid = await event.context.fs.addFile({
      content: file.data,
      path: file.filename,
    })

    return cid

  } else {
    console.log('raw data')

    const body = await readBody(event)

    console.log('size:', body.length)

    // parse file

    return ''
  }
})