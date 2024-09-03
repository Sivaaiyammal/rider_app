export const ApiLoopUntilSuccess = async (callback)=>{
    console.log(callback,'callback function')
    const timer = 5000
    try{
        const response = await callback()
        if(response){
            return
        }else{
            // setTimeout(()=>{
            //     ApiLoopUntilSuccess(callback)
            //     timer+=5000
            // },timer)
        }

    }catch(e){
        console.log(e,'an error occured while loop calls')
    }
}
