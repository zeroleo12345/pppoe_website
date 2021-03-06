const app = {
  state: {
    token: ''
  },
  getters: {
    token: (state) => {
      return state.token
    }
  },
  mutations: {
    SET_TOKEN: (state, token) => {
      state.token = token
    }
  }
}

export default app
