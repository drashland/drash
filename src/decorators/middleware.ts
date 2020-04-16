interface IMiddlewareDecorator {
    resourceName: string,
    middlewareNameToRun: string,
    methodName: string,
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
                resourceName: target.constructor.name,
                middlewareNameToRun: middlewareName,
                methodName: methodName
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
            decorator.methodName === methodName.toUpperCase()
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