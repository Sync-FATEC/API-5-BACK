export const appointmentScheduledTemplate = (params: { pacienteNome: string; examNome: string; dataHora: string; instrucoes?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222;">
    <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;">
      <h2 style="color:#0066cc;">Agendamento Confirmado</h2>
      <p>Olá, ${params.pacienteNome}.</p>
      <p>Seu exame <strong>${params.examNome}</strong> foi agendado para <strong>${params.dataHora}</strong>.</p>
      ${params.instrucoes ? `<h3>Passo a passo do exame</h3><div>${params.instrucoes}</div>` : ''}
      <hr/>
      <p style="font-size:12px;color:#555;">Em caso de dúvidas, entre em contato pelo e-mail atendimento@instituicao.br ou telefone (11) 0000-0000.</p>
    </div>
  </body>
</html>`;

export const appointmentReminderTemplate = (params: { pacienteNome: string; examNome: string; dataHora: string; instrucoes?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222;">
    <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;">
      <h2 style="color:#0066cc;">Lembrete de Exame</h2>
      <p>Olá, ${params.pacienteNome}.</p>
      <p>Lembrete: seu exame <strong>${params.examNome}</strong> está agendado para <strong>${params.dataHora}</strong>.</p>
      ${params.instrucoes ? `<h3>Instruções de preparo</h3><div>${params.instrucoes}</div>` : ''}
      <hr/>
      <p style="font-size:12px;color:#555;">Em caso de dúvidas, entre em contato pelo e-mail atendimento@instituicao.br ou telefone (11) 0000-0000.</p>
    </div>
  </body>
</html>`;

export const appointmentReadyTemplate = (params: { pacienteNome: string; examNome: string; retiradaInfo: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222;">
    <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;">
      <h2 style="color:#0066cc;">Resultado Pronto para Retirada</h2>
      <p>Olá, ${params.pacienteNome}.</p>
      <p>O resultado do seu exame <strong>${params.examNome}</strong> está pronto para retirada.</p>
      <p><strong>Como retirar:</strong> ${params.retiradaInfo}</p>
      <hr/>
      <p style="font-size:12px;color:#555;">Em caso de dúvidas, entre em contato pelo e-mail atendimento@instituicao.br ou telefone (11) 0000-0000.</p>
    </div>
  </body>
</html>`;

export const appointmentCanceledTemplate = (params: { pacienteNome: string; examNome: string; motivo?: string }) => `
<html>
  <body style="font-family: Arial, sans-serif; color:#222;">
    <div style="max-width:600px;margin:auto;padding:20px;border:1px solid #eee;">
      <h2 style="color:#cc0000;">Agendamento Cancelado</h2>
      <p>Olá, ${params.pacienteNome}.</p>
      <p>Seu agendamento para <strong>${params.examNome}</strong> foi cancelado.</p>
      ${params.motivo ? `<p><strong>Motivo:</strong> ${params.motivo}</p>` : ''}
      <hr/>
      <p style="font-size:12px;color:#555;">Em caso de dúvidas, entre em contato pelo e-mail atendimento@instituicao.br ou telefone (11) 0000-0000.</p>
    </div>
  </body>
</html>`;