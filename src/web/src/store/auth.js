import axios from "axios";
import { AUTH_CHECK_URL, LOGOUT_URL } from "../urls";
import router from "../router";

const state = {
    user: null,
    fullName: ""
};
const getters = {
    isAuthenticated: state => !!state.user,
    fullName: state => { return state.fullName },
    dbUser: state => { return state.user.db_user }
};
const actions = {
    async checkAuthentication({ commit }) {
        await axios.get(AUTH_CHECK_URL)
            .then(resp => {                
                commit("setUser", resp.data.data);
            }).catch(() => {
                commit("clearUser");
            });
    },
    async signOut({ commit }) {
        axios.get(LOGOUT_URL)
            .then((resp) => {
                const data = resp.data.data;
                if (data.logout) {
                    commit("clearUser");
                    router.push("/sign-in");
                }
            }).catch(err => {
                console.error(err);
            });
    }
};
const mutations = {
    setUser(state, user) {
        state.user = user;
        state.fullName = user.oid_user.displayName;
    },
    clearUser(state) {
        state.user = null;
        state.fullName = null;
    }
};

export default {
    state,
    getters,
    actions,
    mutations
};