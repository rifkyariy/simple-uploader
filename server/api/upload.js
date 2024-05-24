export default defineEventHandler(async (event) => {
    const body = await readMultipartFormData(event);
    const file = body.find((item) => item.name === 'file');
  
    if (!file) {
      throw createError({ statusCode: 400, statusMessage: 'No file uploaded' });
    }
  
    // Here, you would handle the file (e.g., save it to a directory or cloud storage)
    // For simplicity, we will just return a success message.
  
    return { message: 'File uploaded successfully' };
  });
  