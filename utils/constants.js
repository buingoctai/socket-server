const PORT = 3000;
const BUILD_MESSAGE = {
    /* build state */
    START_BUILD: 'Starting build',
    CLONE_SOURCE: 'Cloning repository',
    CHECKOUT_AND_BUILD: 'Checkout branch, build app',
    /* new states*/
    CHECKOUT_BRANCH: 'Checking out commit',
    INSTALL_PACKAGES: 'Installing packages',
    UPDATE_ABOUT_FILE: 'Updating ABOUT',
    COMPILE_SASS_CREATE_LANG: 'Compiling SASS & translations',
    BUILD_APP: 'Building electron app',
    /* */
    UPLOAD_FILE: 'Uploading file to remote server',
    BUILD_SUCCESS: 'Build Success',
    TIMEOUT: 'Websocket timed out.',
    CLOSE_CONNECT: 'Websocket connection was closed by the client.',
    /* notifications */
    REGISTER_ID: 'Get build state successfully.',
    CANCEL_SUCCESS: 'Build canceled successfully.',
    CANCEL_FAILED: 'Unable to cancel build.',
    GET_STATE_SUCCESS: 'Get build state successfully.',
    GET_STATE_FAILED: 'Get build state failed.',
    NOT_FOUND_ACTION: 'The requested action was not found.',
    /* build  error */
    ERROR_CONNECT: 'Websocket was errCode.',
    ERROR_BUILDER: 'Builder was error in build processing.',
    ERROR_BUILDER_UPLOAD: "The file was fail uploaded.",
    ERROR_BUILDER_INVALID_BRANCH: 'The branch is invalid.',
    ERROR_BUILDER_INVALID_TAG: 'The tag is invalid.',
    ERROR_NON_VPN: 'Non vpn connection',
    ERROR_SERVER_CRASH: 'The connection was turned off by server.',
    ERROR_UNKNOW: 'Unknow from server.',
    /* socket server */
    ERROR_WIN_NOT_READY: 'The win builder is not ready to serve now',
    ERROR_MAC_NOT_READY: 'The mac builder is not ready to serve now',
};


module.exports = {
    PORT,
    BUILD_MESSAGE
}