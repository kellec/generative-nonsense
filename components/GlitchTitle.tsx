import styles from "./GlitchTitle.module.css";

interface Props {
  text: string;
}

export default function GlitchTitle({ text }: Props) {
  return (
    <h1 className={styles.glitch} data-text={text}>
      {text}
    </h1>
  );
}
