import axios from "axios";
import { create } from "zustand";

export const useStore = create((set) => ({
  count: 1,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),

  // -------------------------------------------------------------------------------

  fetchData: async (url) => {
    try {
      const res = await axios.get(url);
      if (!res.status) {
        throw new Error(
          "You absolute imbecile buffoon of a man, fix your network connection"
        );
      }
      return res.data;
    } catch (error) {
      console.log("fetchData Error", error);
    }
  },

  // -------------------------------------------------------------------------------

  fetchData: async (url) => {
    try {
      const res = await axios.get(url);
      if (!res.status) {
        throw new Error(
          "You absolute imbecile buffoon of a man, fix your network connection"
        );
      }
      return res.data;
    } catch (error) {
      console.log("fetchData Error", error);
      throw error;
    }
  },
  

  currentId: 1,
  setCurrentId: () => set((state) => ({currentId: state.currentId < 30 ? state.currentId + 1 : 1, })),

}));
