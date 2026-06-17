import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { PAGE_SIZE, type SeaLionDto } from "../api/types";
import { SeaLionCanvas } from "../components/SeaLionCanvas";
import { SeaLionCard } from "../components/SeaLionCard";
import { DailyContestSection } from "../components/DailyContestSection";
import { Pagination } from "../components/Pagination";
import { useAuth } from "../context/AuthContext";
import { qualityClassName, resolveSeaLionQuality } from "../utils/sealQuality";
import { useTranslation } from "react-i18next";

type FeedMode = "recent" | "week" | "best";

const TOP_FEED_LIMIT = 24;

export function HomePage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState<SeaLionDto | null>(null);
  const [feed, setFeed] = useState<SeaLionDto[]>([]);
  const [feedMode, setFeedMode] = useState<FeedMode>("recent");
  const [feedPage, setFeedPage] = useState(1);
  const [feedTotal, setFeedTotal] = useState(0);
  const [feedLoading, setFeedLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadFeed = useCallback(async (mode: FeedMode, page: number) => {
    setFeedLoading(true);
    try {
      if (mode === "recent") {
        const response = await api.getRecent(page, PAGE_SIZE);
        setFeed(response.items);
        setFeedTotal(response.total);
      } else {
        const response = await api.getTop(mode === "week" ? "week" : "all", TOP_FEED_LIMIT);
        setFeed(response.items);
        setFeedTotal(response.items.length);
      }
    } catch {
      setFeed([]);
      setFeedTotal(0);
    } finally {
      setFeedLoading(false);
    }
  }, []);

  useEffect(() => {
    loadFeed(feedMode, feedPage);
  }, [feedMode, feedPage, loadFeed]);

  const handleFeedModeChange = (mode: FeedMode) => {
    setFeedMode(mode);
    setFeedPage(1);
  };

  const handleGenerate = async () => {
    if (!user) return;
    setGenerating(true);
    setError(null);
    try {
      const seal = await api.generateSeaLion();
      setCurrent(seal);
      await loadFeed(feedMode, feedPage);
      navigate(`/sealions/${seal.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : t("errors.generateFailed"));
    } finally {
      setGenerating(false);
    }
  };

  const feedTitle = {
    recent: t("feed.recent"),
    week: t("feed.topWeek"),
    best: t("feed.best"),
  }[feedMode];

  const feedEmpty = {
    recent: t("recent.empty"),
    week: t("feed.emptyWeek"),
    best: t("feed.emptyBest"),
  }[feedMode];

  return (
    <div className="home">
      <section className="hero">
        <h1>{t("generator.title")}</h1>
        <p className="hero__subtitle">{t("generator.subtitle")}</p>

        {user ? (
          <button type="button" className="btn btn--generate" onClick={handleGenerate} disabled={generating}>
            {generating ? t("generator.generating") : `✨ ${t("generator.generate")}`}
          </button>
        ) : (
          <p className="hero__auth-hint">
            {t("generator.authHintPrefix")}
            <Link to="/login">{t("auth.login")}</Link> {t("common.or")} <Link to="/register">{t("auth.register")}</Link>
            {t("generator.authHintSuffix")}
          </p>
        )}

        {error && <p className="error">{error}</p>}
      </section>

      <section className="preview">
        {current ? (
          <div className={`preview__content ${qualityClassName(current.metadata.quality)}`}>
            <div className="preview__canvas">
              <SeaLionCanvas metadata={current.metadata} width={400} />
            </div>
            <div className="preview__meta">
              <h2>{current.metadata.name}</h2>
              <dl>
                <div>
                  <dt>{t("seaLionMeta.quality")}</dt>
                  <dd className={`preview__quality ${qualityClassName(current.metadata.quality)}`}>
                    {t(`quality.${resolveSeaLionQuality(current.metadata.quality)}`)}
                  </dd>
                </div>
                <div>
                  <dt>{t("seaLionMeta.age")}</dt>
                  <dd>{t("seaLionMeta.ageYears", { count: current.metadata.age ?? 0 })}</dd>
                </div>
                <div>
                  <dt>{t("seaLionMeta.pose")}</dt>
                  <dd>{t(`pose.${current.metadata.pose ?? "upright"}`)}</dd>
                </div>
                <div>
                  <dt>{t("seaLionMeta.expression")}</dt>
                  <dd>{t(`expression.${current.metadata.expression}`)}</dd>
                </div>
                <div>
                  <dt>{t("seaLionMeta.pattern")}</dt>
                  <dd>{t(`pattern.${current.metadata.pattern}`)}</dd>
                </div>
                <div>
                  <dt>{t("seaLionMeta.eyeStyle")}</dt>
                  <dd>{t(`eyeStyle.${current.metadata.eyeStyle}`)}</dd>
                </div>
                {current.metadata.hat && (
                  <div>
                    <dt>{t("seaLionMeta.hat")}</dt>
                    <dd>{t(`hat.${current.metadata.hat}`)}</dd>
                  </div>
                )}
                {current.metadata.accessory && (
                  <div>
                    <dt>{t("seaLionMeta.accessory")}</dt>
                    <dd>{t(`accessory.${current.metadata.accessory}`)}</dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        ) : (
          <div className="preview__placeholder">
            <span>🦭</span>
            <p>{t("generator.previewPlaceholder")}</p>
          </div>
        )}
      </section>

      <DailyContestSection />

      <section className="recent">
        <div className="feed__header">
          <h2>{feedTitle}</h2>
          <div className="feed__tabs" role="tablist" aria-label={t("feed.tabsLabel")}>
            {(["recent", "week", "best"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                role="tab"
                aria-selected={feedMode === mode}
                className={`feed__tab ${feedMode === mode ? "feed__tab--active" : ""}`}
                onClick={() => handleFeedModeChange(mode)}
              >
                {t(`feed.${mode}`)}
              </button>
            ))}
          </div>
        </div>

        {feedLoading ? (
          <p className="recent__empty">{t("common.loading")}</p>
        ) : feed.length === 0 ? (
          <p className="recent__empty">{feedEmpty}</p>
        ) : (
          <>
            <div className="recent__grid">
              {feed.map((seal) => (
                <SeaLionCard key={seal.id} seal={seal} showStats />
              ))}
            </div>
            {feedMode === "recent" && (
              <Pagination
                page={feedPage}
                pageSize={PAGE_SIZE}
                total={feedTotal}
                onPageChange={setFeedPage}
                disabled={feedLoading}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
