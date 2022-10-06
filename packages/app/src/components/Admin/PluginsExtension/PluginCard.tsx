import { faCircleArrowDown, faCircleCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Image from 'next/image';
import Link from 'next/link';

import { SearchResultItem } from '~/models/SearchResultItem';

export const PluginCard = (props: SearchResultItem) => {
  const {
    name, full_name, description, html_url, topics, stargazers_count, owner,
  } = props;

  return (
    <div className="card shadow border-0" key={name}>
      <div className="card-body px-5 py-4">
        <div className="row mb-3">
          <div className="col-9">
            <h2 className="card-title h3 border-bottom pb-2 mb-3">
              <Link href={`/${full_name}`}>{name}</Link>
            </h2>
            <p className="card-text text-muted">{description}</p>
          </div>
          <div className="col-3">
            <Image className="mx-auto" alt="GitHub avator image" src={owner.avatar_url} width={250} height={250} />
          </div>
        </div>
        <div className="row">
          <div className="col-12 d-flex flex-wrap gap-2">
            {topics?.map((topic: string) => {
              return (
                <span key={`${name}-${topic}`} className="badge rounded-1 mp-bg-light-blue text-dark fw-normal">
                  {topic}
                </span>
              );
            })}
          </div>
        </div>
      </div>
      <div className="card-footer px-5 border-top-0 mp-bg-light-blue">
        <p className="d-flex justify-content-between align-self-center mb-0">
          <span>
            {owner.login === 'weseek' ? <FontAwesomeIcon icon={faCircleCheck} className="me-1 text-primary" /> : <></>}

            <a href={owner.html_url} target="_blank" rel="noreferrer">
              {owner.login}
            </a>
          </span>
          <span>
            <FontAwesomeIcon icon={faCircleArrowDown} className="me-1" /> {stargazersCount}
          </span>
        </p>
      </div>
    </div>
  );
};
