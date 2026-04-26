import { useState } from 'react';
import { contentApi } from '../api/content';
import GeneratePanel from '../components/GeneratePanel';

const STEPS_ORDER = ['topics', 'select', 'script', 'seo', 'content', 'marketing', 'saving'];

export default function Generate() {
  const [isLoading,  setIsLoading]  = useState(false);
  const [activeStep, setActiveStep] = useState(null);
  const [result,     setResult]     = useState(null);
  const [error,      setError]      = useState(null);
  const [logs,       setLogs]       = useState([]);


  function handleGenerate(params) {
    setIsLoading(true);
    setError(null);
    setResult(null);
    setActiveStep('topics');
    setLogs(['Starting Content Intelligence Engine...']);

    contentApi.generateStream(
      params,
      (msg) => {
        const nodeToStep = {
          'fetch_past_topics': 'topics',
          'generate_topics': 'topics',
          'select_best_topic': 'select',
          'validate_topic': 'select',
          'generate_script': 'script',
          'validate_script': 'script',
          'generate_seo': 'seo',
          'generate_content': 'content',
          'critique_content': 'content',
          'assemble_final_content': 'marketing',
          'save_to_database': 'saving'
        };
        
        if (msg.step === 'log') {
          // Add detailed thinking logs
          setLogs(prev => [...prev.slice(-12), msg.message]);
          return;
        }

        if (nodeToStep[msg.step]) {
          setActiveStep(nodeToStep[msg.step]);
          setLogs(prev => [...prev.slice(-12), `[STAGING] Moving to ${nodeToStep[msg.step]}...`]);
        }
      },
      (err) => {
        setError(err);
        setLogs(prev => [...prev, `[ERROR] ${err}`]);
        setIsLoading(false);
      },
      (data) => {
        setResult(data);
        setIsLoading(false);
        setActiveStep(null);
      }
    );
  }


  return (
    <div className="fade-in" style={{ maxWidth: 720, margin: '0 auto' }}>
      <GeneratePanel
        onGenerate={handleGenerate}
        isLoading={isLoading}
        activeStep={activeStep}
        result={result}
        error={error}
        logs={logs}
      />

    </div>
  );
}
