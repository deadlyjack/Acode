import ajax from '@deadlyjack/ajax'
import Url from '../utils/Url'
import constants from './constants'

export default {
  get(path) {
    const url = Url.join(constants.API_BASE, path);
    return ajax.get(url);
  },
};
