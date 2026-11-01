import s from './KidStage.module.css'

export default function KidStage({ imageSrc, avatarSrc, showAvatarOverlay, badge, top, left, right, bottom }) {
  return (
    <section className={s.stage}>
      <div className={`${s.panel} ${s.top}`}>{top}</div>
      <aside className={`${s.panel} ${s.left}`}>{left}</aside>
      <figure className={s.pic}>
        {imageSrc && <img className={s.land} src={imageSrc} alt="" />}
        {showAvatarOverlay && avatarSrc && <img className={s.hero} src={avatarSrc} alt="" />}
        {badge && <div className={s.badge}>{badge}</div>}
      </figure>
      {bottom && <div className={`${s.panel} ${s.bottom}`}>{bottom}</div>}
      <aside className={`${s.panel} ${s.right}`}>{right}</aside>
    </section>
  )
}
