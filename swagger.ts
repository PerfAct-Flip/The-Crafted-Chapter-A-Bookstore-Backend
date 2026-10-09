import swaggerJsdoc from "swagger-jsdoc";
import swaggerAutogen from "swagger-autogen";
import env from "./src/config/env";
const port  = env.port;
const doc = {
    info : { title : 'Bookstore api docs', version : '1.0.0'},
    servers : [{url : `http://localhost:${port}`}]
};

const outputFile = './swagger-output.json';

const endpointsFiles = ['./src/index.ts']

swaggerAutogen({openapi : '3.0.0'})(outputFile, endpointsFiles, doc);


// import path from "node:path";

// const options = {
//     definition : {
//   openapi: '3.0.0',
//   info: {
//     title: 'Bookstore API docs',
//     version: '1.0.0',
//   },
//   servers: [
//     {
//         url : `http://localhost:${port}`,
//     },
// ],
// },
// apis : [
//     path.join(__dirname, 'modules/auth/auth.routes'),
//     path.join(__dirname, 'modules/product/product.routes'),
//     path.join(__dirname, 'modules/cart/cart.routes'),
//     path.join(__dirname, 'modules/order/order.routes'),
// ]

// }
// const swaggerSpec = swaggerJsdoc(options);
// export default swaggerSpec;