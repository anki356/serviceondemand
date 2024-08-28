

export const responseObj = (success, data, message, error = [],code=200) => {
  
   
    console.log(message)
    if (message===null)message="Successfully Processed"
    return {
        success,
        data,
        message,
        error,
        code
    }
}