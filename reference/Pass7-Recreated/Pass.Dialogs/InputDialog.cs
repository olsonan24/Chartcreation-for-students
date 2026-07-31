using System;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace Pass.Dialogs;

public class InputDialog : Form
{
	public bool isReady;

	public bool canceled = true;

	public string userInput = "";

	private IContainer components;

	private Label message_txt;

	private TextBox input_txt;

	private Button ok_btn;

	private Button cancel_btn;

	public InputDialog(string Message, string Title)
	{
		InitializeComponent();
		base.FormClosing += pass_input_FormClosing;
		message_txt.Text = Message;
		Text = Title + " - Pass 3";
	}

	private void pass_input_FormClosing(object sender, FormClosingEventArgs e)
	{
		isReady = true;
	}

	private void pass_input_Load(object sender, EventArgs e)
	{
		input_txt.Location = new Point(message_txt.Location.X, message_txt.Location.Y + message_txt.Height + 5);
		ok_btn.Location = new Point(338, input_txt.Location.Y + input_txt.Height + 5);
		cancel_btn.Location = new Point(257, input_txt.Location.Y + input_txt.Height + 5);
		base.Size = new Size(base.Width, ok_btn.Location.Y + ok_btn.Height + 38);
	}

	public static InputData Show(string Message, string Title)
	{
		InputDialog inputDialog = new InputDialog(Message, Title);
		inputDialog.ShowDialog();
		while (!inputDialog.isReady)
		{
			Application.DoEvents();
		}
		InputData result = default(InputData);
		result.Canceled = inputDialog.canceled;
		result.Input = inputDialog.userInput;
		return result;
	}

	private void ok_btn_Click(object sender, EventArgs e)
	{
		userInput = input_txt.Text;
		canceled = false;
		isReady = true;
		Close();
	}

	private void cancel_btn_Click(object sender, EventArgs e)
	{
		Close();
	}

	protected override void Dispose(bool disposing)
	{
		if (disposing && components != null)
		{
			components.Dispose();
		}
		base.Dispose(disposing);
	}

	private void InitializeComponent()
	{
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Dialogs.InputDialog));
		this.message_txt = new System.Windows.Forms.Label();
		this.input_txt = new System.Windows.Forms.TextBox();
		this.ok_btn = new System.Windows.Forms.Button();
		this.cancel_btn = new System.Windows.Forms.Button();
		base.SuspendLayout();
		this.message_txt.AutoSize = true;
		this.message_txt.Location = new System.Drawing.Point(12, 9);
		this.message_txt.MaximumSize = new System.Drawing.Size(403, 0);
		this.message_txt.Name = "message_txt";
		this.message_txt.Size = new System.Drawing.Size(401, 26);
		this.message_txt.TabIndex = 0;
		this.message_txt.Text = "label1nhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnhnh";
		this.input_txt.Location = new System.Drawing.Point(15, 25);
		this.input_txt.Name = "input_txt";
		this.input_txt.Size = new System.Drawing.Size(398, 20);
		this.input_txt.TabIndex = 1;
		this.ok_btn.DialogResult = System.Windows.Forms.DialogResult.OK;
		this.ok_btn.Location = new System.Drawing.Point(338, 51);
		this.ok_btn.Name = "ok_btn";
		this.ok_btn.Size = new System.Drawing.Size(75, 23);
		this.ok_btn.TabIndex = 2;
		this.ok_btn.Text = "OK";
		this.ok_btn.UseVisualStyleBackColor = true;
		this.ok_btn.Click += new System.EventHandler(ok_btn_Click);
		this.cancel_btn.DialogResult = System.Windows.Forms.DialogResult.Cancel;
		this.cancel_btn.Location = new System.Drawing.Point(257, 51);
		this.cancel_btn.Name = "cancel_btn";
		this.cancel_btn.Size = new System.Drawing.Size(75, 23);
		this.cancel_btn.TabIndex = 3;
		this.cancel_btn.Text = "Cancel";
		this.cancel_btn.UseVisualStyleBackColor = true;
		this.cancel_btn.Click += new System.EventHandler(cancel_btn_Click);
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(427, 94);
		base.Controls.Add(this.cancel_btn);
		base.Controls.Add(this.ok_btn);
		base.Controls.Add(this.input_txt);
		base.Controls.Add(this.message_txt);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.MaximizeBox = false;
		base.MinimizeBox = false;
		this.MinimumSize = new System.Drawing.Size(433, 28);
		base.Name = "pass_input";
		this.Text = "Input - Pass 3";
		base.Load += new System.EventHandler(pass_input_Load);
		base.ResumeLayout(false);
		base.PerformLayout();
	}
}
