export default function Donate() {
  import(/* webpackChunkName: "donate" */ './donate').then((res) => {
    const Donate = res.default;
    Donate();
  }
  );
}