export default function Donate(){
  import(/* webpackChunkName: "donate" */ './donate.include').then((res) => {
      const Donate = res.default;
      Donate();
    }
  );
}