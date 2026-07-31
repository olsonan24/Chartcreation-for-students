using System;
using System.Collections.Specialized;
using System.ComponentModel;
using System.Drawing;
using System.Windows.Forms;

namespace Pass.Forms;

public class TermsOfUse : Form
{
	private bool loggedIn;

	public bool isReady;

	private StringCollection serverList;

	private Database dbMan;

	private IContainer components;

	private Button login_btn;

	private Button quit_btn;

	private RichTextBox richTextBox1;

	private PictureBox pictureBox1;

	public static bool Login(Form p)
	{
		TermsOfUse termsOfUse = new TermsOfUse();
		termsOfUse.ShowDialog(p);
		while (!termsOfUse.isReady)
		{
			Application.DoEvents();
		}
		return termsOfUse.loggedIn;
	}

	public TermsOfUse()
	{
		base.StartPosition = FormStartPosition.CenterScreen;
		InitializeComponent();
	}

	private void pass_connect_Closed(object sender, FormClosedEventArgs e)
	{
		isReady = true;
		if (!loggedIn)
		{
			Application.Exit();
		}
	}

	private void quit_btn_Click(object sender, EventArgs e)
	{
		isReady = true;
		Application.Exit();
	}

	private void login_btn_Click(object sender, EventArgs e)
	{
		loggedIn = true;
		Close();
	}

	private void pass_connect_Load(object sender, EventArgs e)
	{
	}

	private void pass_connect_KeyPress(object sender, KeyPressEventArgs e)
	{
	}

	private void pass_connect_Shown(object sender, EventArgs e)
	{
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
		System.ComponentModel.ComponentResourceManager resources = new System.ComponentModel.ComponentResourceManager(typeof(Pass.Forms.TermsOfUse));
		this.login_btn = new System.Windows.Forms.Button();
		this.quit_btn = new System.Windows.Forms.Button();
		this.richTextBox1 = new System.Windows.Forms.RichTextBox();
		this.pictureBox1 = new System.Windows.Forms.PictureBox();
		((System.ComponentModel.ISupportInitialize)this.pictureBox1).BeginInit();
		base.SuspendLayout();
		this.login_btn.Location = new System.Drawing.Point(27, 369);
		this.login_btn.Name = "login_btn";
		this.login_btn.Size = new System.Drawing.Size(75, 23);
		this.login_btn.TabIndex = 3;
		this.login_btn.Text = "I Agree";
		this.login_btn.UseVisualStyleBackColor = true;
		this.login_btn.Click += new System.EventHandler(login_btn_Click);
		this.quit_btn.Location = new System.Drawing.Point(538, 369);
		this.quit_btn.Name = "quit_btn";
		this.quit_btn.Size = new System.Drawing.Size(75, 23);
		this.quit_btn.TabIndex = 4;
		this.quit_btn.Text = "&Quit";
		this.quit_btn.UseVisualStyleBackColor = true;
		this.quit_btn.Click += new System.EventHandler(quit_btn_Click);
		this.richTextBox1.Location = new System.Drawing.Point(27, 72);
		this.richTextBox1.Name = "richTextBox1";
		this.richTextBox1.ScrollBars = System.Windows.Forms.RichTextBoxScrollBars.Vertical;
		this.richTextBox1.Size = new System.Drawing.Size(586, 291);
		this.richTextBox1.TabIndex = 8;
		this.richTextBox1.Rtf = resources.GetString("richTextBox1.Rtf");
		this.pictureBox1.BackColor = System.Drawing.Color.White;
		this.pictureBox1.Image = (System.Drawing.Image)resources.GetObject("pictureBox1.Image");
		this.pictureBox1.Location = new System.Drawing.Point(27, 12);
		this.pictureBox1.Name = "pictureBox1";
		this.pictureBox1.Size = new System.Drawing.Size(166, 54);
		this.pictureBox1.SizeMode = System.Windows.Forms.PictureBoxSizeMode.CenterImage;
		this.pictureBox1.TabIndex = 9;
		this.pictureBox1.TabStop = false;
		base.AutoScaleDimensions = new System.Drawing.SizeF(6f, 13f);
		base.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
		base.ClientSize = new System.Drawing.Size(633, 404);
		base.Controls.Add(this.pictureBox1);
		base.Controls.Add(this.richTextBox1);
		base.Controls.Add(this.quit_btn);
		base.Controls.Add(this.login_btn);
		base.FormBorderStyle = System.Windows.Forms.FormBorderStyle.FixedSingle;
		base.Icon = (System.Drawing.Icon)resources.GetObject("$this.Icon");
		base.MaximizeBox = false;
		base.MinimizeBox = false;
		base.Name = "pass_connect";
		this.Text = "Pass 7";
		base.FormClosed += new System.Windows.Forms.FormClosedEventHandler(pass_connect_Closed);
		base.Load += new System.EventHandler(pass_connect_Load);
		base.Shown += new System.EventHandler(pass_connect_Shown);
		((System.ComponentModel.ISupportInitialize)this.pictureBox1).EndInit();
		base.ResumeLayout(false);
	}
}
