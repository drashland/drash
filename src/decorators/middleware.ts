/**
 * The flow
 *
 * All decorators are compiled at runtime, meaning they are checked up upon on server start.
 * So any methods with @middleware(...) will call a `middleware function straight away
 *
 * To clarify, decorators call a function, `@myFunc` will call a function named `myFunc`
 *
 * Compilation
 * Each decorator calls its method, in our example, its the `middleware` function
 * This will register the middleware's, so their method to run and the class and classes method that wants to run it
 * Here comes an incoming HTTP request,
 * the method that handles this will go through the middleware decorators,
 * and call the middleware to run. So really the req comes in, it checks the resource and the method being used. If theres
 * a middleware with that method and resource, then run the middleware function associated, for example:
 *     eval(fnName)(args) // There has to be a better way than this...
 *
 * This feature will support the use of decorators but only for middleware, eg @middleware('auth')
 */

// THEN ON  REQUEST, USE THE RESOURCE NAME AND METHOD NEEDED TO SEARCH THRU THE MIDDLEWARES AND CALL THE REQUIRED MIDDLEWARE
// METHOD (THAT METHOD WPULD NEED TO BE ADDED EG callMethodByName(methodName)

interface IMiddlewareDecorator {
    resource: any,
    resourceName: string,
    middlewareNameToRun: string,
    resourceMethodNameThatIsUsingTheDecorator: string,
    resourceMethodToRun: Function
}

let middlewareDecorators: IMiddlewareDecorator[] = [];

/**
 * @description
 *     The method to register which middleware to run for the method
 *     with the decorator.
 *
 * @param middlewareToRun
 *     @middleware('auth') // Says: 'run the auth middleware'
 *     @middleware(['auth', 'logout']) // says 'run the auth then logout middleware'
 *
 */
function Middleware (middlewareToRun: string|string[]) {
    return function (target: any, methodName: string, descriptor: PropertyDescriptor) {
        // Useful data
        // console.log({
        //     middlewareToRun, // eg could be 'auth' if we want a route with the middleware of authorisation
        //     class: target.constructor, // the class
        //     methodName, // the method the decorator was used with
        //     descriptor, // holds a few key props
        //     className: target.constructor.name, // the name of the class that holds the method we added the decorator to
        //     methodWithDecorator: descriptor.value, // the actual function that can be called
        // })
        if (typeof middlewareToRun === 'string') middlewareToRun = [middlewareToRun]
        middlewareToRun.forEach(middlewareName => {
            middlewareDecorators.push({
                resource: target.constructor,
                resourceName: target.constructor.name,
                middlewareNameToRun: middlewareName,
                resourceMethodNameThatIsUsingTheDecorator: methodName,
                resourceMethodToRun: descriptor.value
            })
        })
    }
}

function getMiddlewareDecorators (resourceName: string, methodName: string): IMiddlewareDecorator[] {
    let foundMiddlewareDecorators: IMiddlewareDecorator[] = []
    middlewareDecorators.forEach(decorator => {
        if (
            decorator.resourceName === resourceName
            &&
            decorator.resourceMethodNameThatIsUsingTheDecorator === methodName.toUpperCase()
        ) {
            foundMiddlewareDecorators.push(decorator)
        }
    })
    return foundMiddlewareDecorators
}

export {
    Middleware,
    getMiddlewareDecorators
}