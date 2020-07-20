export default {
    MAX_ATTACHMENT_SIZE: 5000000,
    s3: {
        REGION: "us-east-2",
        BUCKET: "music-dashboard-uploads"
    },
    apiGateway: {
        REGION: "us-east-2",
        URL: "https://3n7l32gl97.execute-api.us-east-2.amazonaws.com/prod"
    },
    cognito: {
        REGION: "us-east-2",
        //USER_POOL_ID: "us-east-2_qujAWSQF3",
        //APP_CLIENT_ID: "6k1ttqtf6cbvcpd5ro5h2pchtl",
        USER_POOL_ID: "us-east-2_yToN0O8fm",
        APP_CLIENT_ID: "4ns44et0i2dqf7ac1o1pv01qek",
        IDENTITY_POOL_ID: "us-east-2:85b868a4-9a4d-473a-86dd-6bb105bae384"
    }
};