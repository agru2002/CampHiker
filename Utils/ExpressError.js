class ExpressError extends Error{
    //What more we can pass in error constructor fucntion-headers, stack
    constructor(status, message){
        super();
        this.message=message;
        this.status=status
    }
}

module.exports=ExpressError;