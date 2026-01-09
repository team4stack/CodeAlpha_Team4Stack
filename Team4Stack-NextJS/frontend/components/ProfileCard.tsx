import React from 'react'

type Member = {
  name: string
  role: string
  image: string
  description: string
  portfolio: string
  github: string
}

type Props = {
  member: Member
  isDarkMode: boolean
  onOpenImage: (src: string) => void
  onOpenPortfolio: (url: string) => void
  onOpenGitHub: (url: string) => void
}

const ProfileCard: React.FC<Props> = ({ member, isDarkMode, onOpenImage, onOpenPortfolio, onOpenGitHub }) => {
  return (
    <article className="t4s-card">
      <div className="banner" style={{ backgroundImage: `url(${member.image})` }}>
        <button className="dp" onClick={() => onOpenImage(member.image)} aria-label={`Open ${member.name} image`}>
          <img src={member.image} alt={member.name} />
        </button>
      </div>

      <div className="menu">
        <div className="opener" aria-hidden="true">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>

      <h2 className="name">{member.name}</h2>
      <div className="title">{member.role}</div>

      <div className="actions">
        <div className="follow-info">
          <h2>
            <a href={member.portfolio} onClick={(e) => { e.preventDefault(); onOpenPortfolio(member.portfolio) }}>
              <span>Portfolio</span>
              <small>View</small>
            </a>
          </h2>
          <h2>
            <a href={member.github} onClick={(e) => { e.preventDefault(); onOpenGitHub(member.github) }}>
              <span>GitHub</span>
              <small>Profile</small>
            </a>
          </h2>
        </div>
        <div className="follow-btn">
          <button className="preview-btn w-full" onClick={() => onOpenImage(member.image)}>Preview</button>
        </div>
      </div>

      <p className="desc">{member.description}</p>
    </article>
  )
}

export default ProfileCard


