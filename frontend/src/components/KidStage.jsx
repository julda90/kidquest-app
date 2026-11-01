import s from './KidStage.module.css'

export default function KidStage({ imageSrc, badge, top, left, right, bottom }) {
  return (
    <section className={s.stage}>
      <div className={`${s.panel} ${s.top}`}>{top}</div>
      <aside className={`${s.panel} ${s.left}`}>{left}</aside>
      <div className={s.center}>
        {imageSrc && (
          <figure className={s.pic}>
            <img className={s.land} src={imageSrc} alt="" />
            {badge && <div className={s.badge}>{badge}</div>}
          </figure>
        )}
        {bottom && <div className={`${s.panel} ${s.bottom}`}>{bottom}</div>}
      </div>
      <aside className={`${s.panel} ${s.right}`}>{right}</aside>
    </section>
  )
}
